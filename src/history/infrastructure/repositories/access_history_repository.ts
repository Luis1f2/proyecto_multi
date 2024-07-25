import { AccessHistory } from '../../domain/access_history';

export interface AccessHistoryRepository {
    save(accessHistory: AccessHistory): Promise<AccessHistory>;
    findAll(): Promise<AccessHistory[]>;
}
