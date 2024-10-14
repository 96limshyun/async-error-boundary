import React, { ComponentType, ReactNode } from "react";
import HTTPError from "./HTTPError";
import { ErrorProps } from "./ErrorProps";

interface ErrorBoundaryProps {
    fallback: ComponentType<ErrorProps>;
    onReset: () => void;
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | HTTPError | null;
}

class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
        this.captureReject = this.captureReject.bind(this);
        this.resetError = this.resetError.bind(this);
    }

    static getDerivedStateFromError(error: Error | HTTPError) {
        return { hasError: true, error };
    }

    componentDidMount() {
        window.addEventListener("unhandledrejection", this.captureReject);
    }

    componentWillUnmount() {
        window.removeEventListener("unhandledrejection", this.captureReject);
    }

    captureReject(e: PromiseRejectionEvent) {
        e.preventDefault();
        this.setState({ hasError: true, error: e.reason });
    }

    resetError() {
        this.props.onReset();
        this.setState({ hasError: false, error: null });
    }

    render(): ReactNode {
        const { fallback: Fallback, children } = this.props;
        if (this.state.hasError) {
            return (
                <Fallback
                    statusCode={
                        this.state.error instanceof HTTPError
                            ? this.state.error.statusCode
                            : undefined
                    }
                    resetError={this.resetError}
                    message={this.state.error?.message || undefined}
                />
            );
        }

        return children;
    }
}

export default ErrorBoundary;
