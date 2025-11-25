import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useUnsavedChanges = (isDirty) => {
    const [blockedLocation, setBlockedLocation] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // This is a placeholder for the actual browser prompt, which is not used here.
        // We handle the prompt with our own dialog.
    }, [isDirty]);

    const handleBlockedNavigation = useCallback((nextLocation) => {
        if (isDirty) {
            setBlockedLocation(nextLocation);
            return false; // Block navigation
        }
        return true; // Allow navigation
    }, [isDirty]);

    const confirmNavigation = () => {
        if (blockedLocation) {
            navigate(blockedLocation.pathname);
            setBlockedLocation(null);
        }
    };

    const cancelNavigation = () => {
        setBlockedLocation(null);
    };

    return {
        showConfirmation: !!blockedLocation,
        confirmNavigation,
        cancelNavigation,
        handleBlockedNavigation,
    };
};
