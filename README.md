# SEO Dashboard - React Client

A modern SEO analytics dashboard built with React, TailwindCSS, and Recharts.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Features

- Real-time SEO analytics and metrics
- Interactive charts and data visualization
- Responsive design with TailwindCSS
- Accessible UI components with Headless UI
- Form validation with React Hook Form
- Client-side routing with React Router
- API integration with Axios

## Tech Stack

- **React 19** - UI framework
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library
- **Recharts** - Chart library
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **date-fns** - Date formatting

## Installation

1. Clone the repository and navigate to the client directory:
   ```bash
   cd /Users/yaswanthgandhi/Documents/seo/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   REACT_APP_ENV=development
   ```

## Available Scripts

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

## Project Structure

```
client/
├── public/           # Static files
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── utils/        # Utility functions
│   ├── App.js        # Main app component
│   └── index.js      # Entry point
├── .env.example      # Environment variables template
├── .eslintrc.json    # ESLint configuration
├── tailwind.config.js # TailwindCSS configuration
└── package.json      # Dependencies and scripts
```

## Environment Variables

Create a `.env` file in the root of the client directory with the following variables:

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5001/api)
- `REACT_APP_ENV` - Environment (development/production)

## Code Quality

This project uses ESLint for code quality. The configuration can be found in `.eslintrc.json`.

Run linting with:
```bash
npm run lint
```

## Styling

This project uses TailwindCSS for styling. The configuration can be found in `tailwind.config.js`.

Utility classes and custom components are available through:
- TailwindCSS utilities
- Headless UI components for accessibility
- clsx for conditional class names

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [TailwindCSS documentation](https://tailwindcss.com/docs)
- [React Router documentation](https://reactrouter.com/)
- [Recharts documentation](https://recharts.org/)

## Troubleshooting

### `npm start` fails
- Ensure all dependencies are installed: `npm install`
- Check that your Node.js version is v16 or higher
- Verify that port 3000 is available

### API connection issues
- Ensure the backend server is running
- Verify the `REACT_APP_API_URL` in your `.env` file is correct
- Check CORS configuration on the backend

## License

MIT

