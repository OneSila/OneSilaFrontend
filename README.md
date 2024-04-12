# Getting Started with OneSila Frontend


Welcome to the OneSila Frontend documentation! This guide is designed to help you set up and understand the OneSila Frontend, which works in tandem with the OneSila Headless ERP system. 

In addition to basic setup instructions, this guide will provide an overview of the project structure, making it easier for you to navigate and utilize the various components and features of the application. Whether you are looking to contribute to the project or simply want to get it up and running, the following sections will assist you in getting started.

## Prerequisites

Before you start, ensure you have the following prerequisites installed on your system:

- [Node.js and npm](https://nodejs.org/en/download/) (Node.js 14.x or later)
- [Git](https://git-scm.com/downloads) for cloning the repository
- OneSila Headless Backend (follow the setup instructions in its [repository](https://github.com/OneSila/OneSilaHeadless))

## Setup

1. Open a terminal.
2. Clone the OneSila Frontend repository using Git:

```bash
git clone https://github.com/OneSila/OneSilaFrontend.git
```

3. Navigate to the cloned directory:

```bash
cd OneSilaFrontend
```

4. Install the necessary dependencies:

```bash
npm install
```

## Running the Application

To run the application locally, you need to start both the frontend and the backend services.

### Starting the Backend

1. Ensure you have set up the OneSila Headless Backend. Refer to its [repository](https://github.com/OneSila/OneSilaHeadless) for instructions.
2. Run the backend service:

```bash
./manage.py runserver localhost:8080
```

### Starting the Frontend

1. In a new terminal window, navigate to the OneSila Frontend director
2. Run the following command to start the frontend service:

```bash
VITE_APP_API_GRAPHQL_URL="http://localhost:8080/graphql/" VITE_APP_API_GRAPHQL_WEBSOCKET_URL="ws://localhost:8080/graphql/" npm run dev
```

