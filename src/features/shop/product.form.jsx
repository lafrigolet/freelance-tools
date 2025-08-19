import React, { useState } from "react";
import { withTheme } from "@rjsf/core";
import { Theme as MuiTheme } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";

// Firebase
import { db, storage } from "./firebase"; // your firebase.js config
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import productSchema from "./product.schema.json";
import productUISchema from "./product.uischema.json";

// Bind RJSF with the Material UI theme
const Form = withTheme(MuiTheme);

export default function ProductForm() {
  const [formData, setFormData] = useState({});

  const handleSubmit = async ({ formData }) => {
    try {
      console.log("Product submitted:", formData);

      let imageUrls = [];

      // If user provided File objects in `images`
      if (formData.images && formData.images.length > 0) {
        const uploads = await Promise.all(
          formData.images.map(async (file, idx) => {
            if (file instanceof File) {
              // Save in Firebase Storage under /products/{id}/filename
              const storageRef = ref(storage, `products/${formData.id}/${file.name}`);
              await uploadBytes(storageRef, file);
              const url = await getDownloadURL(storageRef);
              return url;
            } else {
              // Already a URL
              return file;
            }
          })
        );
        imageUrls = uploads;
      }

      const productDoc = {
        ...formData,
        images: imageUrls,
        updatedAt: new Date().toISOString(),
      };

      // Save product in Firestore under "products/{id}"
      await setDoc(doc(db, "products", formData.id), productDoc);

      alert("✅ Product saved successfully!");
      console.log("Saved product:", productDoc);
    } catch (err) {
      console.error("❌ Error saving product:", err);
      alert("Error saving product: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <Form
        schema={productSchema}
        uiSchema={productUISchema}
        formData={formData}
        validator={validator}
        onChange={(e) => setFormData(e.formData)}
        onSubmit={handleSubmit}
        onError={(errors) => console.log("Errors:", errors)}
      />
    </div>
  );
}
