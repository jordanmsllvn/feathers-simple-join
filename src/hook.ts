import { HookContext } from "@feathersjs/feathers";
import simpleJoin, { IOptionsDefinition } from "./simpleJoin";

interface IHookOptionsDefinition {
  with: { service: string; as: string; local: string; remote: string };
  through?: { service: string; local: string; remote: string };
  include?: string[];
  exclude?: string[];
}

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

export default (options: IHookOptionsDefinition) => async (
  context: HookContext
): Promise<HookContext> => {
  if (context.type !== "after") {
    throw new Error(
      `feathers-simple-join: The simpleJoinHook can only be used as an after hook.`
    );
  }
  const finalOptions: IOptionsDefinition = {
    with: {
      ...options.with,
      service: context.app.service(options.with.service)
    },
    include: options.include,
    exclude: options.exclude
  };
  if (options.through) {
    finalOptions.through = {
      ...options.through,
      service: context.app.service(options.through.service)
    };
  }
  context.result = await simpleJoin(context.result, finalOptions);
  return context;
};
