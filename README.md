# SolarLink

SolarLink is a web application that helps users in the UK estimate the potential savings from installing a solar panel and battery system. It provides a simulation tool that uses real-world data to forecast energy generation and cost savings.

## How it Works

The application is composed of a React frontend and a Python (Flask) backend.

### Frontend

- A user-friendly interface built with React and styled with Tailwind CSS.
- Users can input their postcode, the size of their solar array (in kWp), and battery specifications.
- The frontend makes API calls to the backend to run simulations and displays the results.

### Backend

- A Flask server that exposes two main endpoints:
    - `/simulate`: Estimates the average daily solar generation for a given location and array size.
    - `/dispatch`: Runs a 24-hour simulation to determine the optimal battery usage strategy and calculate the potential money saved.
- The backend fetches real-time electricity prices from the Octopus Energy API (using the Agile tariff).
- It uses a greedy dispatch algorithm to decide when to charge the battery from the grid, when to discharge it to power the home, and when to export excess energy.

## Running the Project

To run the project locally, you will need to have Python and Node.js installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SolarLink/solarlink.git
    cd solarlink
    ```

2.  **Set up Python Virtual Environment and Install dependencies:**
    ```bash
    python -m venv .venv
    # On Windows:
    .venv\Scripts\activate
    # On macOS/Linux:
    source .venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

4.  **Configure Octopus Energy API Key:**
    The backend requires an Octopus Energy API key to fetch real-time electricity prices. Set your API key as an environment variable named `OCTOPUS_API_KEY`.

    # On Windows (Command Prompt):
    set OCTOPUS_API_KEY=YOUR_API_KEY_HERE

    # On Windows (PowerShell):
    $env:OCTOPUS_API_KEY="YOUR_API_KEY_HERE"

    # On macOS/Linux:
    export OCTOPUS_API_KEY=YOUR_API_KEY_HERE

5.  **Run the development servers:**
    ```bash
    npm run dev
    ```

This command will concurrently start both the React frontend on `http://localhost:3000` and the Flask backend on `http://localhost:5000`.