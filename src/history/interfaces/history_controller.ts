import { HistoryService } from '../application/history_services';
import { SqlAccessHistoryRepository } from '../infrastructure/sql/sql_access_history_repository';

const accessHistoryRepository = new SqlAccessHistoryRepository();
const historyService = new HistoryService(accessHistoryRepository);

export const handleHistoryMessages = async (message: any, ws: any) => {
    const data = JSON.parse(message);

    switch (data.action) {
        case 'logHistory':
            await handleLogHistory(data.payload, ws);
            break;
        case 'getHistory':
            await handleGetHistory(ws);
            break;
        default:
            ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
            break;
    }
};

const handleLogHistory = async (payload: any, ws: any) => {
    try {
        const { name, lastName, section, entryTime, exitTime, entryPhoto, exitPhoto } = payload;
        const accessHistory = await historyService.logAccess({ name, lastName, section, entryTime, exitTime, entryPhoto, exitPhoto });
        ws.send(JSON.stringify({ action: 'logHistory', status: 'success', accessHistory }));
    } catch (error) {
        handleError(error, 'logHistory', ws);
    }
};

const handleGetHistory = async (ws: any) => {
    try {
        const accessHistory = await historyService.getAccessHistory();
        ws.send(JSON.stringify({ action: 'getHistory', status: 'success', accessHistory }));
    } catch (error) {
        handleError(error, 'getHistory', ws);
    }
};

const handleError = (error: unknown, action: string, ws: any) => {
    if (error instanceof Error) {
        ws.send(JSON.stringify({ action, status: 'error', message: error.message }));
    } else {
        ws.send(JSON.stringify({ action, status: 'error', message: 'Unknown error' }));
    }
};
