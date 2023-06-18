const express = require('express');
const app = express();
require('dotenv').config()
const jwt = require("jsonwebtoken");
const cors = require('cors');
const port = process.env.PORT || 5000;
// const stripe = require("stripe")(process.env.PAYMENT_KEY);

// MiddleWare
app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------------------------

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4botfbx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // DataBase Collection 
        const sliderCollection = client.db("LearnSportsDB").collection("SliderData");
        const coursesCollection = client.db("LearnSportsDB").collection("CoursesData");
        const instructorsCollection = client.db("LearnSportsDB").collection("AllInstructors");
        const usersCollection = client.db("LearnSportsDB").collection("users");
        const AddCourseCollection = client.db("LearnSportsDB").collection("addCourses");
        const SelectedCollection = client.db("LearnSportsDB").collection("SelectedCourse");
        const paymentCollection = client.db("LearnSportsDB").collection("Payment");


        // Populer courses data show----------------------------------------------------
        app.get('/slider', async (req, res) => {
            const result = await sliderCollection.find().toArray();
            res.send(result);
        })

        // All courses data show--------------------------------------------------------
        app.get('/courses', async (req, res) => {
            const result = await coursesCollection.find().toArray();
            res.send(result)
        })

        // All instructors data show ----------------------------------------------------
        app.get('/instructors', async (req, res) => {
            const result = await instructorsCollection.find().toArray();
            res.send(result)
        })

        // user API --------------------------------------------------------------------
        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });
        // user posted
        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: "user already exists" });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id;

            const { role } = req.body;

            // Define your condition based on the role
            let updatedRole;
            if (role === "admin") {
                updatedRole = "admin";
            } else if (role === "instructor") {
                updatedRole = "instructor";
            } else {
                return res.status(400).json({ error: "Invalid role" });
            }

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: updatedRole,
                },
            };

            try {
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: "Failed to update user role" });
            }
        });
        // user admin data geted
        app.get("/users/admin/:email",  async (req, res) => {
            const email = req.params.email;
            
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === "admin" };
            res.send(result);
        });
        // Instructor API ---------------------------------------------------------
        app.get("/users/instructor/:email",  async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { instructor: user?.role === "instructor" };
            res.send(result);
        });
        // Instructor API ---------------------------------------------------------
        app.get("/AllInstructorsAddFromDatabase",  async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { instructor: user?.role === "instructor" };
            res.send(result);
        });
        // All Courses API
        app.post("/addCourse", async (req, res) => {
            const addCourses = req.body;
            const result = await AddCourseCollection.insertOne(addCourses);
            res.send(result);
        });
        // my Course
        app.get("/myCourse/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await AddCourseCollection.find(query).toArray();
            res.send(result);
        });
        // All Courses From Add
        app.get("/AllCoursesFromAdd", async (req, res) => {
            const result = await AddCourseCollection.find().toArray();
            res.send(result);
        });
        app.delete("/myCourse/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await AddCourseCollection.deleteOne(query);
            res.send(result);
        });
        // all Course
        app.get("/allCourses", async (req, res) => {
            const result = await AddCourseCollection.find().toArray();
            res.send(result);
        });
        app.get("/allCourses/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await AddCourseCollection.find(query).toArray();
            res.send(result);
        });
        // instructors
        app.get("/instructors", async (req, res) => {
            const quary = { role: "instructor" };
            const result = await usersCollection.find(quary).toArray();
            res.send(result);
        });

    //  approved
    app.patch("/allCourses/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const { feedback, stutus } = req.body;
  
        const updateDoc = { $set: { feedback } };
        if (stutus) {
          updateDoc.$set.stutus = stutus;
        }
        const result = await AddCourseCollection.updateOne(query, updateDoc);
        res.send(result);
      });
      //  select Course
      app.post("/select",  async (req, res) => {
        const selectedCourse = req.body;  
        const existingCourse = await SelectedCollection.findOne(selectedCourse);
        if (existingCourse) {
          res.status(400).send("Selected Course already exists");
          return;
        }
        const result = await SelectedCollection.insertOne(selectedCourse);
        res.send(result);
      });
  
      app.get("/select",  async (req, res) => {
        const result = await SelectedCollection.find().toArray();
        res.send(result);
      });
  
      app.get("/select/:user",  async (req, res) => {
        const user = req.params.user;
        const query = { user: user };
        const result = await SelectedCollection.find(query).toArray();
        res.send(result);
      });
  
      app.get("/selected/:id",  async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await SelectedCollection.find(query).toArray();
        res.send(result);
      });
  
      app.delete("/select/:id",  async (req, res) => {
        const id = req.params.id;
  
        const query = { _id: new ObjectId(id) };
        const result = await SelectedCollection.deleteOne(query);
        res.send(result);
      });
  
      // create payment intent
      app.post("/create-payment-intent", async (req, res) => {
        const { price } = req.body;
        const amount = price * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
  
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      });
  
      // payment related api
  
      app.patch("/payments",  async (req, res) => {
        const payment = req.body;
  
        // Insert payment document only if it doesn't exist
        const query = { className: payment.className };
        const existingPayment = await paymentCollection.findOne(query);
      console.log(existingPayment)
        if (!existingPayment) {
          const insertedResult = await paymentCollection.insertOne(payment);
  
          // Update the Course document in paymentCollection
          const filter = { className: payment.className };
          const updateDoc = {
            $inc: {
              availableSeat: -1,
              enrolledStuNum: 1,
            },
          };
  
          const updatePaymentResult = await paymentCollection.updateOne(
            filter,
            updateDoc,
            { upsert: false }
          );
  
          // Update the Course document in CourseCollection
          const updateCourseResult = await AddCourseCollection.updateOne(
            filter,
            updateDoc,
            { upsert: false }
          );
  
          res.send({ insertedResult, updatePaymentResult, updateCourseResult });
        } else {
          // delete from selected Coursees //
          const deletedSelected = await SelectedCollection.deleteOne(query);
  
          res.send({ message: "Payment document already exists" });
        }
      });
  
      // pyment history 
      app.get("/payment/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const result = await paymentCollection.find(query).toArray();
        res.send(result);
      });

        // Send a ping to confirm a successful connection   
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Learning sports is starting')
})

app.listen(port, () => {
    console.log(`Learning sports is starting on port : ${port}`);
})