const express = require("express");

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../controllers/contacts");
const { contactValidationSchema } = require("../models/contacts");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch {
    return res.status(500).send("Something went wrong");
  }
});

router.post("/", async (req, res) => {
  const { error } = contactValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const { name, email, phone, favorite } = req.body;
    const contact = await addContact(name, email, phone, favorite);
    return res.status(200).json(contact);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Something went wrong!");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (id.length !== 24) {
      return res.status(400).send("Wrong id provided");
    }
    const contact = await getContactById(id);
    if (!contact) {
      return res.status(404).send("Contact not found");
    }
    res.status(200).json(contact);
  } catch {
    return res.status(500).send("Something went wrong");
  }
});

router.delete("/:id", async (req, res) => {
  const contactId = req.params.id;
  try {
    const removed = await removeContact(contactId);
    if (removed) {
      return res.status(200).send("Contact deleted");
    } else {
      return res.status(404).send("Contact not found");
    }
  } catch (err) {
    return res.status(500).send("Something went wrong");
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("Id is required to perform update");
  }
  const { error } = contactValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const contact = getContactById(id);
  if (!contact) {
    return res.status(404).send("Contact not found");
  }
  try {
    updateContact(id, req.body);
    return res.status(200).send("Contact sucessfully updated!");
  } catch {
    return res.status(500).send("Something went wrong!");
  }
});

router.patch("/:contactId/favorite", async (req, res) => {
  const { contactId } = req.params;

  const { error } = contactValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send("missing field favorite");
  }

  try {
    const updatedContact = await updateStatusContact(contactId, req.body);
    return res.status(200).send(updatedContact);
  } catch (err) {
    return res.status(404).send("Contact not found");
  }
});

module.exports = router;
