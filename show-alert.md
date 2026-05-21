# Alert Component Cheat Sheet

Here's a comprehensive guide to all the usage options for the `showAlert` function in your application:

## Basic Usage

```jsx
// Simple info alert (auto-dismisses after 5 seconds)
showAlert('This is an informational message');

// Success alert
showAlert('Operation completed successfully!', { type: 'success' });

// Warning alert
showAlert('Please check your inputs', { type: 'warning' });

// Error alert
showAlert('Failed to save changes', { type: 'error' });
```

## Alert Types

| Type      | Color  | Icon               | Example Usage |
|-----------|--------|--------------------|---------------|
| `info`    | Blue   | FaInfoCircle       | `showAlert('Info message', { type: 'info' })` |
| `success` | Green  | FaCheckCircle      | `showAlert('Success!', { type: 'success' })` |
| `warning` | Orange | FaExclamationTriangle | `showAlert('Warning!', { type: 'warning' })` |
| `error`   | Red    | FaExclamationCircle | `showAlert('Error occurred', { type: 'error' })` |

## Positioning Options

```jsx
// Top right (default)
showAlert('Top right alert', { position: 'top-right' });

// Top left
showAlert('Top left alert', { position: 'top-left' });

// Top center
showAlert('Top center alert', { position: 'top-center' });

// Bottom right
showAlert('Bottom right alert', { position: 'bottom-right' });

// Bottom left
showAlert('Bottom left alert', { position: 'bottom-left' });

// Bottom center
showAlert('Bottom center alert', { position: 'bottom-center' });
```

## Action Button

```jsx
// With action button
showAlert('Email not verified', {
  actionText: 'Verify Now',
  onAction: () => navigate('/verify-email')
});

// Custom action with different type
showAlert('New version available', {
  type: 'info',
  actionText: 'Update Now',
  onAction: checkForUpdates,
  position: 'bottom-right'
});
```

## Duration Control

```jsx
// Auto-dismiss after 3 seconds
showAlert('This will disappear quickly', { duration: 3000 });

// Auto-dismiss after 10 seconds
showAlert('This stays longer', { duration: 10000 });

// Persistent alert (won't auto-dismiss)
showAlert('Important message!', { duration: 0 });
```

## Close Button Control

```jsx
// Show close button (default)
showAlert('You can close me', { showClose: true });

// Hide close button
showAlert('You must wait', { showClose: false, duration: 5000 });
```

## Advanced Examples

```jsx
// Complex alert with multiple options
showAlert('Your session will expire soon', {
  type: 'warning',
  actionText: 'Extend Session',
  onAction: extendUserSession,
  position: 'top-center',
  duration: 10000,
  showClose: false
});

// Error alert with retry action
showAlert('Failed to load data', {
  type: 'error',
  actionText: 'Retry',
  onAction: fetchData,
  duration: 0  // Won't auto-dismiss
});

// Success alert with navigation action
showAlert('Profile updated successfully!', {
  type: 'success',
  actionText: 'View Profile',
  onAction: () => navigate('/profile'),
  duration: 5000
});
```

## Full Options Reference

| Option       | Type     | Default       | Description |
|--------------|----------|---------------|-------------|
| `message`    | string   | Required      | The text message to display |
| `type`       | string   | 'info'        | Alert type: 'info', 'success', 'warning', 'error' |
| `actionText` | string   | undefined     | Text for the action button |
| `onAction`   | function | undefined     | Callback when action button is clicked |
| `position`   | string   | 'top-right'   | Position: 'top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center' |
| `duration`   | number   | 5000 (5 sec)  | Auto-dismiss time in milliseconds (0 for no auto-dismiss) |
| `showClose`  | boolean  | true          | Whether to show the close button |
| `onClose`    | function | undefined     | Custom close handler (overrides default hide behavior) |

## Pro Tips

1. **Combine options** for maximum effect:
   ```jsx
   showAlert('File upload complete!', {
     type: 'success',
     actionText: 'View Files',
     onAction: () => navigate('/files'),
     position: 'bottom-right',
     duration: 3000
   });
   ```

2. **Use duration: 0** for important alerts that shouldn't auto-dismiss:
   ```jsx
   showAlert('Critical system maintenance scheduled', {
     type: 'warning',
     duration: 0
   });
   ```

3. **Chain actions** by calling showAlert again in onAction:
   ```jsx
   showAlert('Do you want to delete this item?', {
     type: 'warning',
     actionText: 'Confirm Delete',
     onAction: () => {
       deleteItem();
       showAlert('Item deleted', { type: 'success' });
     },
     duration: 0
   });
   ```

4. **Customize per context**:
   ```jsx
   // In forms
   showAlert('Please fill all required fields', {
     type: 'warning',
     position: 'top-center'
   });

   // For system notifications
   showAlert('New message received', {
     type: 'info',
     position: 'bottom-right',
     duration: 3000
   });
   ```

This cheat sheet covers all available options and provides practical examples for using the alert system throughout your application.