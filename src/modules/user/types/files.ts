import { MulterFileType } from '../../../common/utils/multer.util';

export type ProfileImages = {
  imageProfile: MulterFileType[];
  bgImage: MulterFileType[];
};
