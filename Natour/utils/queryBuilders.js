class FluentMongoose {

  //mongoose base query builder , url queryString
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString
  }

  // filter methods | get the records with specifics column' values
  filter() {
    // filtering the query object - removing filter fields
    const blackList = ['page','sortBy', 'limit', 'columns'];
    let filterOptions = {...this.queryString};

    blackList.forEach((item, i) => {
      delete filterOptions[item];
    });

    // advanced filtering - comparising operator - $lte,$gt,$gte..
    filterOptions = JSON.stringify(filterOptions);
    filterOptions = filterOptions.replace(/\b lte|gte|gt|lt \b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(filterOptions));

    return this;
  }

  // sorting
  sortBy() {
    const {sortBy} = this.queryString;
    console.log('sorting..');
    if (sortBy) {
      this.query.sort(sortBy);
    }else {
      this.query.sort("createdAt");
    };

    return this;
  }

  // fieldLimiting
  fieldLimit() {
    const {columns} = this.queryString;
    // column selection limiting
    if (columns) {
      this.query.select(columns);
    }else {
      this.query.select("-__v");
    };

    return this;
  }

  // paginating
  paginate(totalCount) {
    const {limit,page} = this.queryString;
    if (limit && page) {
      let toSkip = +((page-1) * limit);
      if (toSkip > totalCount) throw new Error('page does ot exist');
      this.query.skip(toSkip).limit(+(limit));
    }else if (page) {
      let toSkip = +((page-1) * 10);
      if (toSkip > totalCount) throw new Error('page does ot exist');
      this.query.skip(toSkip).limit(10);
    }else {
      this.query.skip(0).limit(10);
    };
    return this;
  }
}

exports.FluentMongoose = FluentMongoose; 
