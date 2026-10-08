const express = require("express");
const Joi = require("joi");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");

const router = express.Router();

let products = [];
let nextId = 1;

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().positive().required(),
  category: Joi.string()
    .valid("electronics", "clothing", "food", "other")
    .required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).optional(),
  imageUrl: Joi.string().optional(),
  createdAt: Joi.string().optional()
});

const patchSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  price: Joi.number().positive(),
  category: Joi.string().valid("electronics", "clothing", "food", "other"),
  stock: Joi.number().integer().min(0),
  description: Joi.string().max(500),
  imageUrl: Joi.string()
}).min(1);

router.get("/", (req, res) => {
  let result = [...products];

  const { category, minPrice, maxPrice } = req.query;

  if (category) {
    result = result.filter(product => product.category === category);
  }

  if (minPrice !== undefined) {
    result = result.filter(product => product.price >= Number(minPrice));
  }

  if (maxPrice !== undefined) {
    result = result.filter(product => product.price <= Number(maxPrice));
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const total = result.length;
  const start = (page - 1) * limit;

  result = result.slice(start, start + limit);

  res.json({
    data: result,
    total,
    page,
    limit
  });
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(item => item.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Товар не найден"
    });
  }

  res.json(product);
});

router.post("/", validate(productSchema), (req, res) => {
  const product = {
    id: nextId++,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    ...(req.body.description !== undefined && {
      description: req.body.description
    }),
    ...(req.body.imageUrl !== undefined && {
      imageUrl: req.body.imageUrl
    }),
    createdAt: new Date().toISOString()
  };

  products.push(product);

  res.status(201).json(product);
});

router.put("/:id", validate(productSchema), (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Товар не найден"
    });
  }

  products[index] = {
    id,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    ...(req.body.description !== undefined && {
      description: req.body.description
    }),
    ...(req.body.imageUrl !== undefined && {
      imageUrl: req.body.imageUrl
    }),
    createdAt: products[index].createdAt
  };

  res.json(products[index]);
});

router.patch("/:id", validate(patchSchema), (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(item => item.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Товар не найден"
    });
  }

  Object.assign(product, req.body);

  res.json(product);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Товар не найден"
    });
  }

  products.splice(index, 1);

  res.status(204).send();
});

router.post("/:id/image", upload.single("image"), (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(item => item.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Товар не найден"
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: "Изображение не загружено"
    });
  }

  product.imageUrl = `/uploads/products/${req.file.filename}`;

  res.json({
    message: "Изображение загружено",
    imageUrl: product.imageUrl
  });
});

module.exports = router;
