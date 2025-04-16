import { useQuery } from "@tanstack/react-query";
import { QueryKeysEnum } from "../../../../enums/query-keys.enum";
import { GetLastImageInfoResponse } from "../../../../proto/image";
import { useUserStore } from "../../../../store/user.store";
import { useUploadImageStore } from "../../upload-image.store";
import { useEffect } from "react";
import { httpClient } from "../../../../clients/http.client";
import { ProcessingStatusEnum } from "../../../../enums/processing-status.enum";

export const useLastImageInfo = ({
  processingStatus,
}: {
  processingStatus?: ProcessingStatusEnum;
}) => {
  const { user } = useUserStore((s) => s);
  const { setActiveImageId } = useUploadImageStore((s) => s);

  const lastImageInfo = () => {
    return httpClient.get<GetLastImageInfoResponse>("get-last-image-info", {
      params: {
        userId: user?.id,
      },
    });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      QueryKeysEnum.LAST_IMAGE_INFO,
      user,
      processingStatus === ProcessingStatusEnum.COMPLETED,
    ],
    queryFn: lastImageInfo,
  });

  useEffect(() => {
    if (data?.image?.id) {
      setActiveImageId(data.image.id);
    }
  }, [data?.image?.id, setActiveImageId]);

  return { data, isLoading, isError };
};
