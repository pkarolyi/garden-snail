import { Provider } from "@nestjs/common";
import { LocalStorageService } from "./providers/local.provider";
import { STORAGE_SERVICE } from "./storage.constants";

function storageProviderFactory() {
  return new LocalStorageService();
}

export const storageProvider: Provider = {
  provide: STORAGE_SERVICE,
  useFactory: storageProviderFactory,
};
