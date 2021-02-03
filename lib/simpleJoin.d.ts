import { Service } from "@feathersjs/feathers";
export interface IOptionsDefinition {
    with: {
        service: Service<any>;
        as: string;
        local: string;
        remote: string;
    };
    through?: {
        service: Service<any>;
        local: string;
        remote: string;
    };
    include?: string[];
    exclude?: string[];
}
/**
 * Optimized join. Works for simple foreign key joins as well as join table joins.
 * Foreign key example:
 * ```
 *  let recordsWithJoinedData = await simpleJoin(users, {
 *    with: {service: app.service('groups'), as: 'group', local: 'groupId', remote: 'id'}
 *  })
 * ```
 *
 * Join table example:
 * ```
 *  let recordsWithJoinedData = await simpleJoin(users, {
 *    with: {service: app.service('groups'), as: 'group', local: 'id', remote: 'id'},
 *    through: {service: app.service('groups-users'), local: 'userId', remote: 'groupId' }
 *  })
 * ```
 *
 * Optionally can add a list of fields to be excluded and or included on the join
 *
 * Include only certain fields example:
 * ```
 *  let recordsWithJoinedData = await simpleJoin(users, {
 *    with: {service: app.service('groups'), as: 'group', local: 'id', remote: 'id'},
 *    through: {service: app.service('groups-users'), local: 'userId', remote: 'groupId' },
 *    include: ['fieldOne', 'fieldTwo']
 *  })
 * ```
 *
 * Join all fields except excluded:
 * ```
 *  let recordsWithJoinedData = await simpleJoin(users, {
 *    with: {service: app.service('groups'), as: 'group', local: 'id', remote: 'id'},
 *    through: {service: app.service('groups-users'), local: 'userId', remote: 'groupId' },
 *    exclude: ['fieldOne', 'fieldTwo']
 *  })
 * ```
 * @param options
 */
export default function simpleJoin(records: any, options: IOptionsDefinition): Promise<any>;
