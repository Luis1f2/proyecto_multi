import { AccessHistoryRepository } from '../infrastructure/repositories/access_history_repository';
import { AccessHistory } from '../domain/access_history';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export class HistoryService {
    constructor(private accessHistoryRepository: AccessHistoryRepository) {}

    async logAccess(historyData: any): Promise<AccessHistory> {
        // Guardar las fotos en el sistema de archivos
        const entryPhotoPath = this.saveImage(historyData.entryPhoto, 'entry');
        const exitPhotoPath = this.saveImage(historyData.exitPhoto, 'exit');

        historyData.entryPhoto = entryPhotoPath;
        historyData.exitPhoto = exitPhotoPath;

        const accessHistory = new AccessHistory(historyData);
        return await this.accessHistoryRepository.save(accessHistory);
    }

    async getAccessHistory(): Promise<AccessHistory[]> {
        return await this.accessHistoryRepository.findAll();
    }

    private saveImage(base64Image: string, type: string): string {
        const imageBuffer = Buffer.from(base64Image, 'base64');
        const imageName = `${type}-${uuidv4()}.png`;
        const imagePath = path.join(__dirname, '../../../uploads', imageName);  // Ruta ajustada para 'uploads' fuera de 'src'
        fs.writeFileSync(imagePath, imageBuffer);
        return imageName;  // Almacenar solo el nombre del archivo en la base de datos
    }
}
