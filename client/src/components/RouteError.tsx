import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

const RouteError: React.FC = () => {
  const error = useRouteError();

  console.log("RouteError entry");
  console.error(error);

  let message = "Unknown error";
  let title = '';

if (isRouteErrorResponse(error)) {
    title = `Error ${error.status}`;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p>Route Error:</p>
      <p>{message}</p>
    </div>
  );
};

export default RouteError;
