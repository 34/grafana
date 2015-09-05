define([
  'plugins/datasource/elasticsearch/queryBuilder'
], function(ElasticQueryBuilder) {
  'use strict';

  describe('ElasticQueryBuilder', function() {

    it('with defaults', function() {
      var builder = new ElasticQueryBuilder();

      var query = builder.build({
        metrics: [{type: 'Count', id: '0'}],
        timeField: '@timestamp',
        bucketAggs: [{type: 'date_histogram', field: '@timestamp', id: '1'}],
      });

      expect(query.query.filtered.filter.bool.must[0].range["@timestamp"].gte).to.be("$timeFrom");
      expect(query.aggs["1"].date_histogram.extended_bounds.min).to.be("$timeFrom");
    });

    it('with multiple bucket aggs', function() {
      var builder = new ElasticQueryBuilder();

      var query = builder.build({
        metrics: [{type: 'count', id: '1'}],
        timeField: '@timestamp',
        bucketAggs: [
          {type: 'terms', field: '@host', id: '2'},
          {type: 'date_histogram', field: '@timestamp', id: '3'}
        ],
      });

      expect(query.aggs["2"].terms.field).to.be("@host");
      expect(query.aggs["2"].aggs["3"].date_histogram.field).to.be("@timestamp");
    });


    it('with select field', function() {
      var builder = new ElasticQueryBuilder();

      var query = builder.build({
        metrics: [{type: 'avg', field: '@value', id: '1'}],
        bucketAggs: [{type: 'date_histogram', field: '@timestamp', id: '2'}],
      }, 100, 1000);

      var aggs = query.aggs["2"].aggs;
      expect(aggs["1"].avg.field).to.be("@value");
    });

    it('with term agg and order by metric agg', function() {
      var builder = new ElasticQueryBuilder();

      var query = builder.build({
        metrics: [{type: 'count', id: '1'}, {type: 'avg', field: '@value', id: '5'}],
        bucketAggs: [
          {type: 'terms', field: '@host', size: 5, order: 'asc', orderBy: '5', id: '2' },
          {type: 'date_histogram', field: '@timestamp', id: '3'}
        ],
      }, 100, 1000);

      var firstLevel = query.aggs["2"];
      var secondLevel = firstLevel.aggs["3"];

      expect(firstLevel.aggs["5"].avg.field).to.be("@value");
      expect(secondLevel.aggs["5"].avg.field).to.be("@value");
    });

  });

});
