class Apifeaturs {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  // filter() {
  //   let data = JSON.stringify(this.queryString);
  //   data = data.replace(/(\b{gte|gt|lt|lte}\b)/g, (match) => `$${match}`);
  //   this.query = this.query.find(JSON.parse(data));
  //   return this;
  // }
  sort() {
    if (this.queryString.sort) {
      const sort = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sort);
    }
    return this;
  }
  fieldlimit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
  module.exports = Apifeaturs ;
  