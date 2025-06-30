# RaceSight - Advanced Telemetry & Insights Dashboard

> From Raw Telemetry to Racetrack Triumphs.

This project is a comprehensive web-based dashboard that ingests and visualizes race analysis data. It was built for a hackathon to demonstrate a modern, user-friendly tool for motorsport analysis.

## What it does

RaceSight transforms complex race data into beautiful, intuitive, and actionable visualizations. It allows users to upload multiple JSON files—a core race analysis file, an optional AI-generated insights summary, and optional AI-generated social media content—to create a unified, interactive experience.

-   **Multi-Source Data Integration:** Seamlessly combines race telemetry, strategic insights, and social media content into a single dashboard.
-   **Interactive Multi-View Dashboard:** Navigate between a high-level `Overview`, and deep-dives into `Pace`, `Strategy`, `Driver`, and `Insights`.
-   **Granular Car Analysis:** Select any car for a detailed breakdown, including stint-by-stint performance, predictive tire degradation models, and a complete pit stop timeline.
-   **AI-Powered Content Hub:** View executive summaries, marketing angles, and ready-to-publish social media posts generated from race highlights.
-   **Automated Data Relationship Discovery:** Automatically links content from insights and social media files to specific cars, drivers, and manufacturers in the race data.
-   **Modern, Responsive UI:** A clean, professional interface with robust light and dark theme support, built for any device.

## How we built it

-   **Frontend:** **React** with **TypeScript**, built using **Vite** for a lightning-fast development experience.
-   **Routing:** **React Router** for seamless navigation between the main dashboard and detailed car views.
-   **State Management:** **React Context API** provides a centralized, robust way to manage state from multiple asynchronous data sources, including loading and error states.
-   **Styling:** **Tailwind CSS** with a custom, themeable design system using CSS variables for effortless light/dark mode switching.
-   **Data Visualization:** **Recharts** for creating beautiful, interactive, and composable charts.
-   **Icons:** **Lucide React** for a clean and consistent icon set.

The architecture is component-based and modular. Reusable components like `BarChartWrapper` and `CarCard` ensure a consistent look and feel while simplifying development. The `DataContext` is the application's backbone, orchestrating data flow and enabling advanced features like cross-referencing between different datasets.

## Challenges we ran into

-   **Complex State Management:** Juggling three potentially large, independent JSON files with their own loading and error states. We solved this by creating a unified `DataContext` that encapsulates all data-related logic, providing a clean API to the rest of the application.
-   **Data Integrity & Cross-Referencing:** Linking unstructured text from insights/social media files to structured race data (e.g., matching `#4` in a tweet to Car #4's performance) required careful string parsing and data mapping. Our `extractDataRelationships` function in the `DataContext` handles this logic.
-   **Informative Visualizations:** Designing charts and cards that are not just pretty but also convey complex information (like tire degradation models) at a glance required careful component design and data preparation.

## What's next for RaceSight

-   **Real-Time Data Feeds:** Integrate with a WebSocket or message queue for live telemetry updates during a race.
-   **Predictive Analytics:** Implement machine learning models to predict optimal strategies or race outcomes.
-   **User Authentication & Cloud Storage:** Allow users to save their analysis sessions and manage historical race data.

## Getting Started

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser to `http://localhost:5173`.

5.  Upload your data files. The application expects up to three JSON files:
    -   **Race Analysis (Required):** The main file containing all telemetry, lap times, pit stops, etc.
    -   **Race Insights (Optional):** A file containing an executive summary and marketing angles.
    -   **Social Media (Optional):** A file containing generated social media posts.