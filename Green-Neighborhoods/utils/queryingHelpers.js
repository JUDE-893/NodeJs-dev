const pool = require('../config/db');

/* function that execute Sql queries
 * query: sql string query
 * payload: array of values to be replace the placeholder inside the query string | recieved from the
 */
async function executeQuery(query,payload=null) {
  try {
    const promissedResult = await new Promise( (resolve,reject) => {
      //connecting
      pool.getConnection( (error,connection) => {

        // check for error
        if (error) {
          console.log(`ERROR : Connection Failed \nQuery: ${query}\n${error}`);
          reject(error);
          return;
        }

        // querying
        connection.query(query, payload, (err,result) => {
          //check for error
          if (err) {
            console.log(`ERROR : Query Execution Failed \nQuery: ${query}\n${error}`);
            reject(err);
            return;
          }
          resolve(result)
        })
      })
    });
    return {result: promissedResult,error:null};

  } catch (e) {
    console.log(`ERROR : Query Execution Failed \nQuery: ${query}\n${e}`);
    return {error: e,result:null};
  }
}

// callBack function that retrieve the output from the DB as params (error,result) then return it to the client as responses
const retriever = (error,result,res) => {
    if(error){
      res.status(404).json({message: "fails1", error: error })
    }else{
      res.status(200).json({message: "success", data: result})
    }
  }

// callBack function that retrieve the output from the DB as params (error,result) then irrigate the tempate with the retrieved data then render it to the client as static resourse
const templater = (res,error,data,template) => {
    if(error){
      //// NOTE: to be replaced with error page template
      res.status(404).json({message: "fails", error: error.message });
      return;
    }
      res.render(template,{data});
  }


module.exports = {executeQuery,retriever,templater};
