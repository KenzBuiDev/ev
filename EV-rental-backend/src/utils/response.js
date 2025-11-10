exports.ok = (res, data, meta) => res.status(200).json({ success: true, data, meta });
exports.created = (res, data) => res.status(201).json({ success: true, data });
exports.err = (res, code = 500, message = "Internal Server Error") =>
  res.status(code).json({ success: false, error: { code, message } });
