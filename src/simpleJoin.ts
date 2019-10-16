import { uniq } from "lodash";
import { Service } from "@feathersjs/feathers";

interface IOptionsDefinition {
  with: { service: Service<any>; as: string; local: string; remote: string };
  through?: { service: Service<any>; local: string; remote: string };
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

export async function simpleJoin(records: any, options: IOptionsDefinition) {
  // TODO: clone records
  if (!options.with)
    throw new Error('feathers-simple-join: Cannot call without "with" defined');
  if (options.include && options.exclude)
    throw new Error(
      "feathers-simple-join: Cannot have both includes and excludes"
    );

  let forcedArray = false;
  if (!Array.isArray(records)) {
    records = [records];
    forcedArray = true;
  }

  // Joining:

  const localIds = uniq(records.map((r: any) => r[options.with.local]));

  if (options.through) {
    // Join array with join table

    const joins = await options.through.service.find({
      query: {
        [options.through.local]: { $in: localIds }
      }
    });

    const remotesFromJoin = joins.map((j: any) => j[options.through!.remote]);

    const remotes = await options.with.service.find({
      query: {
        [options.with.remote]: { $in: remotesFromJoin }
      }
    });

    records = records.map((r: any) => {
      const remoteJoinsForRecord = joins
        .filter((j: any) => j[options.through!.local] === r[options.with.local])
        .map((j: any) => j[options.through!.remote]);
      r[options.with.as] = remotes.filter((rm: any) =>
        remoteJoinsForRecord.indexOf(rm[options.with.remote] > -1)
      );
    });
  } else {
    // Join single record with foreign key

    const remotes = await options.with.service.find({
      query: {
        [options.with.remote]: { $in: localIds }
      }
    });
    records = records.map((r: any) => {
      r[options.with.as] = remotes.find(
        (rm: any) => rm[options.with.remote] === r[options.with.local]
      );
    });
  }

  // Field Filtering:
  
  if (options.include && options.include.length) {
    records = records.map((r: any) => {
      let joinedRecord = r[options.with.as];
      if (Array.isArray(joinedRecord)) {
        joinedRecord = joinedRecord.map((jr: any) => {
          const fields: any = {};
          for (const include of options.include!) {
            if (jr[include]) fields[include] = jr[include];
          }
          joinedRecord = fields;
        });
      } else {
        const fields: any = {};
        for (const include of options.include!) {
          if (joinedRecord[include]) fields[include] = joinedRecord[include];
        }
        joinedRecord = fields;
      }
      r[options.with.as] = joinedRecord;
      return r;
    });
  } else if (options.exclude) {
    // TODO
  }
  return records;
}
