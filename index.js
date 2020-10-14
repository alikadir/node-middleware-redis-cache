import express from "express";
import mung from "express-mung";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const cacheKey = `${req.path}|${JSON.stringify(req.body)}`;
  console.log("======= Check to cache =======");
  console.log({ cacheKey });
  req.myCacheKey = cacheKey;
  next();
});

app.use(
  mung.json((body, req, res) => {
    console.log("======= Write to cache =======");
    console.log(req.myCacheKey);
    console.log(body);
  })
);

app.all("/dummyendpoint/:id", (req, res) => {
  res.json({ id: req.params.id, name: "alikadir" });
});

app.listen(1453, () => {
  console.log("Server running at http://localhost:1453");
});
