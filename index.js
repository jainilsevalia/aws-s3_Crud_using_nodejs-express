const express = require("express");
const AWS = require("aws-sdk");
const axios = require("axios");
const url = require("url");
const path = require("path");
const { match } = require("assert");
const app = express();
const PORT = 5000;

app.use(express.json());
app.listen(PORT);

AWS.config.update({
  region: "us-east-1",
  accessKeyId: "ASIAZAQMWLWXLSZQINFP",
  secretAccessKey: "QGVbsiEUnjXEdwEszbB/OGolJ8vwm2SGFsfhOUh8",
  sessionToken:
    "FwoGZXIvYXdzEGwaDCwF9GHPYK5WxKLSMCLAAbj5qUydpFM8wqx7Wm8czZ83tF7I+toLSjYxg+yKEtLaDqM3+inqqWrZOHY8OE+fFicT6s0X6/nfIsiPsXyCCcA/btPFoLYr/KgXsvWIoc6dh2V5p9BO8SMbJLIbxsgk8CZ/J2btDh7gKFok3OHKyAo+Uq+/kTaTTStf0HqSWh2fTv5/9o2lIIv8k1UcMOWkfDrpZJk4wC7CiqCPox8fn48bBxH5DxJwNMf3HxwbUZO4/xwIbeJX7oygKTw99kVFbSi87d6fBjItOFIEb0G3VkTAePhUAW/WTlxeZgIFf2Z3wbXnyE3HB48g5ChRyzDMSvAp/zO9",
});

const robUrl = "http://52.91.127.198:8080/start";
const EC2URL = "";
const s3Bucket = "s3-temp-jainil";
const s3 = new AWS.S3();

axios({
  url: robUrl,
  method: "POST",
  body: {
    banner: "B00925445",
    ip: "",
  },
}).then(function (res) {
  response.status(200).send(res.data);
});

app.post("/storedata", (req, res) => {
  const s3String = req.body.data;

  if (s3String) {
    try {
      s3.upload(
        {
          Body: s3String,
          Bucket: s3Bucket,
          Key: "file.txt",
        },
        (err, data) => {
          if (err) {
            res.status(500);
            console.error(err);
          } else {
            console.log(data);
            const s3uri = data.Location;
            res.json({
              s3uri: s3uri,
            });
            res.status(200);
          }
        }
      );
    } catch (err) {
      console.log(err);
      res.send(500);
    }
  } else {
    res.send(500);
  }
});

app.post("/appenddata", (req, res) => {
  const newData = req.body.data;
  console.log(newData);

  if (newData) {
    s3.getObject({ Bucket: s3Bucket, Key: "file.txt" }, (err, data) => {
      if (err) {
        console.log("Inside error ");
        console.error(err);
        res.status(500);
      } else {
        existingContent = data.Body.toString();
        console.log(`Existing content: ${existingContent}`);

        const appendedContent = existingContent + newData;
        console.log(`Appended content: ${appendedContent}`);

        s3.upload(
          {
            Bucket: s3Bucket,
            Key: "file.txt",
            Body: appendedContent,
          },
          (err, data) => {
            if (err) {
              console.error(err);
              return;
            } else {
              console.log(data);
              res.send(200);
              console.log(`File appended successfully: ${data.Location}`);
            }
          }
        );
      }
    });
  } else {
    res.status(500);
  }
});

app.post("/deletefile", (req, res) => {
  const s3Uri = req.body.s3uri;
  console.log(s3Uri);

  const parsedUrl = url.parse(s3Uri);

  const { dir, base } = path.parse(parsedUrl.pathname);
  const bucket = parsedUrl.hostname.split(".")[0];
  const key = path.join(dir.substring(1), base);

  console.log(bucket);
  console.log(key);

  s3.deleteObject(
    {
      Bucket: bucket,
      Key: key,
    },
    function (err, data) {
      if (err) {
        res.send(500);
        console.log(err, err.stack);
      } else {
        console.log("File deleted successfully");
        res.send(200);
      }
    }
  );
});
