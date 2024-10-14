export interface ErrorProps {
    statusCode?: number;
    resetError?: () => void;
    message?: string;
}
