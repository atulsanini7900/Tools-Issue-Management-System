// Centralized API configuration
// Reads from Vite environment variable 'VITE_API_BASE_URL' when built or hosted.
// Defaults to local development URL 'http://localhost:5000' during offline testing.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tools-issue-management-system-fkgd.onrender.com";
