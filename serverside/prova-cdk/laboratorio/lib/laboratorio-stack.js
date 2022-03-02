const { Stack, Duration } = require('aws-cdk-lib');
const creaLambda = require('./crea-lambda');
// const sqs = require('aws-cdk-lib/aws-sqs');

class LaboratorioStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

	new creaLambda.CreaLambda(this, "LambdaCreata");
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'LaboratorioQueue', {
    //   visibilityTimeout: Duration.seconds(300)
    // });
  }
}

module.exports = { LaboratorioStack }
