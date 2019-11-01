const advancedResults = (model, populate) => async (req, res, next) => {
  // let query = JSON.stringify(req.query);
  // query = query.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  // query = JSON.parse(query);

  let query;

  let queryStr = { ...req.query };

  const removeFields = ["select", "sort", "limit", "page"];

  // Loop over removeFields and delete them from
  removeFields.forEach(param => delete queryStr[param]);

  query = model.find(queryStr);

  // Select Fields (?select={field1},{field2}...)
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort (?sort=-{field} or {field})
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  }

  // Pagination result
  const pagination = {};

  // Limit & Pagination
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
  }

  // If populate
  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const result = await query;

  res.advancedResults = {
    success: true,
    count: result.length,
    pagination,
    data: result
  };

  next();
};

module.exports = advancedResults;
