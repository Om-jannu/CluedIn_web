const pool = require('../models/dbConnect');

module.exports = {
    get: (request, response, next) => {
        var draw = request.query.draw;

        var start = request.query.start;

        var length = request.query.length;

        var order_data = request.query.order;

        if (typeof order_data == 'undefined') {
            // var column_name = 't1.nm_id';

            var column_sort_order = 'desc';
        }
        else {
            var column_index = request.query.order[0]['column'];
            // console.log(column_index);

            var column_name = request.query.columns[column_index]['data'];
            // console.log(column_name);

            var column_sort_order = request.query.order[0]['dir'];
        }

        //search data

        var search_value = request.query.search['value'];

        var search_query = `
         AND (t1.nm_title LIKE '%${search_value}%' 
          OR t1.nm_message LIKE '%${search_value}%' 
          OR t2.label_name LIKE '%${search_value}%'
         )
        `;

        //Total number of records without filtering
        var session = request.session;
        var sender_id = session.senderid;

        pool.query(`SELECT COUNT(*) AS Total FROM notification_message where sender_id = ${sender_id}`, function (error, data) {

            var total_records = data[0].Total;
            // console.log(total_records);

            //Total number of records with filtering
            var qry1 = `SELECT COUNT(*) AS Total FROM notification_message t1 , label_master t2 WHERE  t1.sender_id = ${sender_id} ${search_query}`
            // console.log("qry1",qry1);
            pool.query(qry1, function (error, data) {

                // console.log(data);
                var total_records_with_filter = data[0].Total;

                // var query = `
                // SELECT t1.* FROM user_message t1
                // WHERE 1 ${search_query} 
                // ORDER BY ${column_name} ${column_sort_order} 
                // LIMIT ${start}, ${length}
                // `;

                var query = `select  t1.* , t2.label_name 
                from notification_message t1 , label_master t2 
                where t1.sender_id = ${sender_id} and t1.nm_label_id = t2.label_id 
                ${search_query} 
                ORDER BY ${column_name} ${column_sort_order} 
                LIMIT ${start}, ${length}`

                var data_arr = [];
                // console.log("qry",query);
                pool.query(query, function (error, data) {

                    data.forEach(function (row) {
                        // console.log("row",row);
                        data_arr.push({
                            'nm_title': row.nm_title,
                            'nm_message': row.nm_message,
                            // 'dateOfExpiration': row.dateOfExpiration,
                            // 'scheduled_date': row.scheduled_date,
                            'label_name': row.label_name
                        });
                    });
                    // console.log("data",data_arr);

                    var output = {
                        'draw': draw,
                        'iTotalRecords': total_records,
                        'iTotalDisplayRecords': total_records_with_filter,
                        'aaData': data_arr

                    };
                    // console.log("op",output);
                    response.json(output);

                });

            });

        });
    }
}