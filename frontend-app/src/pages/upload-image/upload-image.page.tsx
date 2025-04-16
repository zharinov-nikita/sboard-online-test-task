import { memo } from "react";
import { LastImageInfoComponent } from "./components/last-image-info/last-image-info.component";
import { UploadImageForm } from "./components/upload-image-form/upload-image-form.component";

const UploadImagePage = memo(() => {
  return (
    <div className="flex flex-col gap-8">
      <UploadImageForm />
      <LastImageInfoComponent />
    </div>
  );
});

export default UploadImagePage;
