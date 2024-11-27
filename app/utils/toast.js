export const failedToast = () =>
  shopify.toast.show("Something went wrong!", {
    duration: 4000,
    status: "critical",
  });

export const successToast = () =>
  shopify.toast.show("Success! 🎉", { duration: 4000, status: "success" });
