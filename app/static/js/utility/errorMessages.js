

export function createErrorElement(
  errorMessage, retryCall,
  container, selectRelated, selector
) {
  // Create the container div
  const errorContainer = document.createElement('div');
  errorContainer.classList.add('error-container');

  // Create the alert div
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('alert', 'alert-danger', 'text-center');
  alertDiv.setAttribute('role', 'alert');
  alertDiv.textContent = errorMessage; // Use the error message argument

  // Create the retry button
  const retryButton = document.createElement('div');
  retryButton.classList.add('btn', 'btn-secondary');
  retryButton.setAttribute('id', 'retryGrids');
  retryButton.textContent = 'Повторить';

  retryButton.addEventListener('click', event => {
    errorContainer.remove();
    retryCall(
      container, selectRelated, selector
    );
  })

  // Append alert and retry button to the error container
  errorContainer.appendChild(alertDiv);
  errorContainer.appendChild(retryButton);


  // Add the container to the body (or you can append it to any specific element)
  document.body.appendChild(errorContainer);

  // Return the created element in case you want to manipulate it later
  return errorContainer;
}


export const createLoadSpinner = (spinnerId) => {
  const spinner = document.createElement('div');
  spinner.id = spinnerId;
  spinner.classList.add('spinner-border', 'text-secondary')
  spinner.setAttribute('role', 'status');
  const spinnerSpan = document.createElement('span');
  spinnerSpan.textContent = "Loading";
  spinner.appendChild(spinnerSpan);
  return spinner;
}
