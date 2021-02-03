import { HookContext } from "@feathersjs/feathers";
interface IHookOptionsDefinition {
    with: {
        service: string;
        as: string;
        local: string;
        remote: string;
    };
    through?: {
        service: string;
        local: string;
        remote: string;
    };
    include?: string[];
    exclude?: string[];
}
declare const _default: (options: IHookOptionsDefinition) => (context: HookContext<any>) => Promise<HookContext<any>>;
/**
 * Optimized join hook. Works for simple foreign key joins as well as join table joins.
 *
 * **After hook only.**
 *
 * Foreign key example:
 * ```
 *  simpleJoin({
 *    with: {service: 'groups', as: 'group', local: 'groupId', remote: 'id'}
 *  })
 * ```
 *
 * Join table example:
 * ```
 *  simpleJoin({
 *    with: {service: 'groups', as: 'group', local: 'id', remote: 'id'},
 *    through: {service: 'groups-users', local: 'userId', remote: 'groupId' }
 *  })
 * ```
 *
 * Optionally can add a list of fields to be excluded and or included on the join
 *
 * Include only certain fields example:
 * ```
 *  simpleJoin({
 *    with: 'groups', as: 'group', local: 'id', remote: 'id'},
 *    through: 'groups-users', local: 'userId', remote: 'groupId' },
 *    include: ['fieldOne', 'fieldTwo']
 *  })
 * ```
 *
 * Join all fields except excluded:
 * ```
 *  simpleJoin({
 *    with: 'groups', as: 'group', local: 'id', remote: 'id'},
 *    through: 'groups-users', local: 'userId', remote: 'groupId' },
 *    exclude: ['fieldOne', 'fieldTwo']
 *  })
 * ```
 * @param options
 */
export default _default;
