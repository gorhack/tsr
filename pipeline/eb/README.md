## AWS
#### **No longer deployed to AWS\**
### App
The Elastic Beanstalk (EB) setup is complete for _TSR_ in the `./pipeline/eb` directory with configuration and docker
files. If you need to deploy to elastic beanstalk locally, install the
[eb cli](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html).

The application deploys to AWS during CI/CD pipeline on the `master` branch. Manual steps to deploy your
local changes:
1. build the application `./pipeline/build.sh`
1. `eb deploy tracked-events --label [name of deploy]`

### Auth
A dev/testing keycloak environment deployed to EC2 at https://kc.tracked.events. Test user login test:password

### Certificate
Route 53 for the domain alias mapping. Certificate Manager to create the TLS certificate.

### AWS Initial Setup

#### Configure ./pipeline/eb/.ebextensions

Create Certificate in Certificate Manager. Copy Certificate Arn to `AWSEBV2LoadBalancerListenerHTTPS -> Certificates ->
CertificateArn`

#### Using EB CLI
To initialize app through the CLI, run `eb init -p docker tsr`

Additional environment configuration in `.ebextensions` which add the alb's HTTP redirect and configure the health path
to `/actuator/health`.

To create EB environment with Postgresql RDS, run
```
eb create tracked-events \
--database.engine postgres --database.version 12.3 \
--envvars TSR_KEYCLOAK_HOST=https://kc.tracked.events,TSR_KEYCLOAK_SECRET_KEY=random-password
```

Add the new RDS's security group to the elastic beanstalk application's security groups.