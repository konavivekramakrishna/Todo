# CI/CD Workflow

This GitHub Actions workflow automates the Continuous Integration (CI) and Continuous Deployment (CD) process for a Node.js application. It runs tests, deploys to production, and sends Slack notifications based on the success or failure of the workflow stages.

## Purpose

The purpose of this workflow is to ensure the reliability and stability of the application by automatically running tests on every push to the repository. It also automates the deployment process to production and notifies relevant stakeholders via Slack about the outcome of the CI/CD pipeline

## Usage

1. **Push Event Trigger**: The workflow is triggered on every push event to the repository.

2. **Environment Variables**:

   - `PG_DATABASE`: The name of the PostgreSQL database used for testing.
   - `PG_USER`: The username for connecting to the PostgreSQL database.
   - `PG_PASSWORD`: The password for connecting to the PostgreSQL database.
   - `MY_RENDER_SERVICE_ID`: The service ID required for deployment to Render.
   - `MY_RENDER_API_KEY`: The API key required for deployment to Render.
   - `SLACK_WEBHOOK_URL`: The webhook URL for sending Slack notifications.

3. **Jobs**:

   - **run-tests**: Executes unit tests, runs the application, and performs integration tests.
   - **deploy**: Deploys the application to production if the tests are successful.
   - **notify**: Sends Slack notifications based on the outcome of the tests and deployment.

4. **Execution Flow**:
   - The workflow begins by running tests (unit and integration) against the application.
   - If the tests pass successfully, the application is deployed to production.
   - Slack notifications are sent to relevant channels or users based on the success or failure of the tests and deployment.

## Future Maintenance

For future maintenance:

- Ensure that environment variables are kept up-to-date, especially if there are changes in database configurations or deployment platforms.
- Regularly review and update the workflow to incorporate any changes in testing frameworks, deployment strategies, or notification mechanisms.
- Monitor the Slack notifications to promptly address any failures or issues in the CI/CD pipeline.
