# PasteApp

PasteApp is a web application built with React and Vite that allows users to create, view, and manage text pastes. It leverages Redux for state management and Tailwind CSS for styling. The application uses local storage instead of a database to store paste data.

## Features

- **Create Paste**: Users can create new pastes with a title and content.
- **View Paste**: Users can view the details of a specific paste.
- **Edit Paste**: Users can edit existing pastes.
- **Delete Paste**: Users can delete pastes.
- **Search Paste**: Users can search for pastes by title or content.
- **Copy to Clipboard**: Users can copy paste content to the clipboard.
- **Share Paste**: Users can share pastes via the browser's native share functionality.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Vite**: A build tool that provides a fast development environment.
- **Redux**: A state management library for JavaScript apps.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **React Router**: A library for routing in React applications.
- **Lucide React**: A collection of icons for React.
- **React Hot Toast**: A library for showing toast notifications in React.

## Deployment

The application is deployed and can be accessed at [PasteApp](https://paste-app-mu.vercel.app/).

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/PasteApp.git
    ```
2. Navigate to the project directory:
    ```sh
    cd PasteApp
    ```
3. Install dependencies:
    ```sh
    npm install
    ```

## Usage

1. Start the development server:
    ```sh
    npm run dev
    ```
2. Open your browser and navigate to `http://localhost:5173`.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the project for production.
- `npm run lint`: Runs ESLint to check for linting errors.
- `npm run preview`: Previews the production build.

## Project Structure

```
PasteApp/
├── public/
├── src/
│   ├── components/
│   │   ├── Home.jsx
│   │   ├── Navbar.jsx
│   │   ├── Paste.jsx
│   │   └── ViewPaste.jsx
│   ├── data/
│   │   └── Navbar.js
│   ├── redux/
│   │   ├── pasteSlice.jsx
│   │   └── store.js
│   ├── utils/
│   │   └── formatDate.js
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── App.css
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Redux](https://redux.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/)
- [React Hot Toast](https://react-hot-toast.com/)
