function getApiBase() {
  const { protocol, hostname, port } = window.location;

  if (protocol === "file:") {
    return "http://localhost:3000";
  }

  if ((hostname === "localhost" || hostname === "127.0.0.1") && port && port !== "3000") {
    return "http://localhost:3000";
  }

  return "";
}

function getFormSubmitError(err) {
  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return "Could not reach the server. Open this site at http://localhost:3000 and run npm start.";
  }
  return err.message || "Something went wrong. Please try again.";
}
