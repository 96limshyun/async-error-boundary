# async-error-boundary

A React error boundary component library for handling asynchronous errors. It allows easy management of HTTP errors and displays custom error fallbacks.

## Installation

You can install the package using npm:

```bash
npm install async-error-boundary
```

Or if you're using yarn:
```bash
yarn add async-error-boundary
```

## Usage
### ErrorBoundary Component
Use the ErrorBoundary component to catch and handle errors occurring in its child components.

```tsx
import { ErrorBoundary } from 'async-error-boundary';
import ErrorFallback from './ErrorFallback';

function App() {
  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onReset={() => { navigate('/') }}
    >
      <ApiComponent />
    </ErrorBoundary>
  );
}
```

### ErrorBoundary Properties

| Name               | Type                              | Required | Description                                |
| ------------------ | --------------------------------- | -------- | ------------------------------------------ |
| `fallbackComponent` | `React.ComponentType<ErrorProps>` | Yes      | Fallback component to display when an error occurs |
| `onReset`           | `() => void`                      | Yes      | Function to reset the error state          |
| `children`          | `React.ReactNode`                 | Yes      | Child components to be wrapped             |

## HTTPError Class

Use the HTTPError class to create and handle HTTP errors.
```tsx
import { HTTPError } from 'async-error-boundary';

try {
  const response = await fetch("api/endpoint");
  if (!response.ok) {
    const errorData = await response.json();
    throw new HTTPError(response.status, errorData.message);
  }
} catch (error) {
  if (error instanceof Error) {
    throw error;
  } else {
    throw new HTTPError(400);
  }
}
```

## HTTPError Constructor
```ts
constructor(statusCode: number, message?: string)
```

| Name         | Type     | Required | Description                                                |
| ------------ | -------- | -------- | ---------------------------------------------------------- |
| `statusCode` | `number` | Yes      | HTTP status code                                           |
| `message`    | `string` | No       | Error message (uses default error message if not provided) |

## Custom Error Fallback Component
Create a custom error fallback component using the ErrorProps type. It's important to set a default value for statusCode as it may be undefined if the error is not an instance of HTTPError.
```tsx
import { ErrorProps } from "async-error-boundary";

const HTTP_ERROR_MESSAGE = {
  404: {
    HEADING: "404",
    BODY: "The page you requested could not be found.",
    BUTTON: "Go to Home",
  },
  500: {
    HEADING: "Server Error",
    BODY: "An error occurred on the server. Please try again later.",
    BUTTON: "Refresh",
  },
  400: {
    HEADING: "Bad Request",
    BODY: "The request was invalid. Please check and try again.",
    BUTTON: "Go to Home",
  },
};

const ErrorFallback = ({ statusCode = 404, resetError, message }: ErrorProps) => {
  // Set a default value of 404 for statusCode.
  // This handles cases where the error is not an HTTPError and statusCode is undefined.
  const currentStatusCode = statusCode as keyof typeof HTTP_ERROR_MESSAGE;
  const { HEADING, BODY, BUTTON } = HTTP_ERROR_MESSAGE[currentStatusCode];
  
  return (
    <div>
      <h1>{HEADING}</h1>
      <p>{BODY}</p>
      <button onClick={resetError}>{BUTTON}</button>
      {message && <div>{message}</div>}
    </div>
  );
};

export default ErrorFallback;
```

## API
### `<ErrorBoundary>`
A React component that catches and handles errors.

### Props

| Name               | Type                              | Required | Description                                               |
| ------------------ | --------------------------------- | -------- | --------------------------------------------------------- |
| `fallbackComponent` | `React.ComponentType<ErrorProps>` | Yes      | Fallback component to display when an error occurs        |
| `onReset`           | `() => void`                      | Yes      | Function to reset the error state                         |
| `children`          | `React.ReactNode`                 | Yes      | Child components to be wrapped                            |

### `HTTPError`
A class representing HTTP errors.
### Properties

| Name         | Type     | Description                                   |
| ------------ | -------- | --------------------------------------------- |
| `name`       | `string` | Always set to `"HTTPError"`                   |
| `statusCode` | `number` | HTTP status code                              |
| `message`    | `string` | Error message                                 |

### Methods
| Name          | Return Type | Description                                                  |
| ------------- | ----------- | ------------------------------------------------------------ |
| `constructor` | `HTTPError` | Creates an instance of `HTTPError` with a status code and an optional error message. |

### `ErrorProps`
The type of properties passed to the error fallback component.

```ts
interface ErrorProps {
  statusCode?: number;
  resetError?: () => void;
  message?: string;
}
```

| Name          | Type           | Required | Description                                                        |
| ------------- | -------------- | -------- | ------------------------------------------------------------------ |
| `statusCode`  | `number`       | No       | HTTP status code. Undefined if not provided.                       |
| `resetError`  | `() => void`   | No       | Function to reset the error state. Provided by `ErrorBoundary`.     |
| `message`     | `string`       | No       | Error message. Undefined if not provided.                          |

## Example
Using HTTPError in an API Component
```tsx
import { useEffect } from "react";
import { HTTPError } from "async-error-boundary";

const DEFAULT_STATUS_CODE = 400;

const ApiComponent = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("api/endpoint");
        if (!response.ok) {
          const errorData = await response.json();
          throw new HTTPError(response.status, errorData.message);
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new HTTPError(DEFAULT_STATUS_CODE);
        }
      }
    };

    fetchData();
  }, []);

  return <div>ApiComponent</div>;
};

export default ApiComponent;
```

In this example, errors occurring during the API call are handled using HTTPError. The ErrorBoundary will catch this error and display the appropriate error fallback.

## Note

- ErrorBoundary catches all JavaScript errors in its child components. However, it doesn't automatically catch asynchronous errors (e.g., errors in fetch requests). In such cases, you need to explicitly throw an HTTPError.
- If the error is not an instance of HTTPError, statusCode will be undefined. Therefore, it's crucial to set a default value for statusCode in your fallback component (e.g., 404). This ensures appropriate fallback display for all types of errors.
- While message is optional, it can be useful for providing more detailed error information to the user.
- The resetError function is provided by ErrorBoundary and is used to reset the error state. Calling this function will execute the function passed to the onReset prop of ErrorBoundary.

## Best Practices

1. Always set a default value for statusCode in your fallback component:
```
const ErrorFallback = ({ statusCode = 404, resetError, message }: ErrorProps) => {
  // ...
}
```

2. Whenever possible, use HTTPError to throw errors. This provides more specific error information:
```
throw new HTTPError(response.status, errorData.message);
```

3. For unknown errors, consider throwing an HTTPError with a default status code:
```
throw new HTTPError(DEFAULT_STATUS_CODE);
```

These practices ensure consistent error handling for all types of errors.

