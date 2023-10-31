# Elastic Id Poster
A simple app that takes in a list of fhir ids and then does the following
- resource type lookup in hapi-fhir's postgresdb. 
  > Even though the fhir spec allows for search queries to be run on the base url `[base]?_id=foobar` hapi-fhir itself is yet to implement that feature. This then necessitates going to the postgresdb to find what resource type the id is.
- get the resource data from hapi-fhir
- restructure the data and post it to kafka

## Environment variables
    # how many ids to process at a time
    ID_BATCH_SIZE=10
    # file name and relative path of the input ids
    INPUT_FILE=input.dat
    # url to postgres db
    PGHOST=postgres-1
    # postgres user to connect as
    PGUSER=postgres
    # password for said user
    PGPASSWORD=postgres 
    # database to connect to
    PGDATABASE=hapi
    # hapi-fhir port on which its api is running on
    HAPI_PORT=8080
    # url of the hapi-fhir api
    HAPI_URL=hapi-fhir
    # url of the kafka instance to connect to
    KAFKA_URL=kafka-01:9092,kafka-02:9092,kafka-03:9092
    # kafka topic to post the messages to
    KAFKA_TOPIC=2xx

## Running
Since all these external services are running in a docker swarm without any ports exposed, you'll need to attach to the relevant services' networks. By default in cdr these are not attachable and so the easiest (and way in which there is no down time on services) is to deploy a service into the swarm. The provided docker compose file has all the necessary setup to easily run. `docker stack deploy -c ./docker/docker-compose.yml stack_name`
