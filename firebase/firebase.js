require("dotenv").config();
const admin = require("firebase-admin");

private_key_split = process.env.private_key.split(String.raw`\n`).join('\n');

const {
    apiKey,
    authDomain,
    projectId
  } = process.env;
  
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId
  };
  //hi :3
  const { 
      type, 
      project_id, 
      private_key_id, 
      // private_key, 
      client_email, 
      client_id, 
      auth_uri, 
      token_uri, 
      auth_provider_x509_cert_url, 
      client_x509_cert_url 
  } = process.env;
  
  private_key = private_key_split;
  
  const serviceAccount = { 
      type, 
      project_id, 
      private_key_id,
      private_key,
      client_email, 
      client_id, 
      auth_uri, 
      token_uri, 
      auth_provider_x509_cert_url, 
      client_x509_cert_url 
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.bucket_url
  });

  const db = admin.firestore();

  const books = db.collection("books");
  const users = db.collection("users");
  const teacher_picks = db.collection("teacher_picks");
  const email_queue = db.collection("email_queue");
  const bucket = admin.storage().bucket();

  console.log("Firebase initialized");

  module.exports = { db, books, users, teacher_picks, email_queue, bucket };
