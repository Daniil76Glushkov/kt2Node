module.exports = function errorHandler(err, req, res, next) {
  console.error(err.message);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Файл слишком большой. Максимальный размер — 2 МБ"
    });
  }

  if (err.message === "Разрешены только JPEG и PNG изображения") {
    return res.status(400).json({
      message: err.message
    });
  }

  res.status(500).json({
    message: "Внутренняя ошибка сервера"
  });
};
