import { Service } from "@feathersjs/feathers";

//TODO: Remove lodash dependency.

export interface IOptionsDefinition {
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

export default async function simpleJoin(
  records: any,
  options: IOptionsDefinition
): Promise<any> {
  // Don't do anything at all if we have an empty record set
  if (!records || (Array.isArray(records) && !records.length)) {
    return records;
  }

  if (!options.with)
    throw new Error('feathers-simple-join: Cannot call without "with" defined');
  if (options.include && options.exclude)
    throw new Error(
      "feathers-simple-join: Cannot have both includes and excludes"
    );

  // TODO: deep clone records
  let workingRecords;

  // If we are working with paginated data we need to extract the data
  let paginated = false;
  if (records.data && records.total) {
    workingRecords = records.data;
    paginated = true;
  } else {
    workingRecords = records;
  }

  // If we are working with a single record, we need to force it into an array so it can be processed in the same manner
  let forcedArray = false;
  if (!Array.isArray(workingRecords)) {
    workingRecords = [workingRecords];
    forcedArray = true;
  }

  // Joining:

  //get a set of unique ids from our local record set (there are probably records with duplicate remote keys)
  const localIds = Array.from(
    new Set(workingRecords.map((r: any) => r[options.with.local]))
  );

  if (options.through) {
    // Join array with join table

    const joins = await options.through.service.find({
      query: {
        [options.through.local]: { $in: localIds }
      },
      paginate: false
    });

    const remotesFromJoin = joins.map((j: any) => j[options.through!.remote]);

    const remotes = await options.with.service.find({
      query: {
        [options.with.remote]: { $in: remotesFromJoin }
      },
      paginate: false
    });

    workingRecords = workingRecords.map((r: any) => {
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
      },
      paginate: false
    });
    workingRecords = workingRecords.map((r: any) => {
      r[options.with.as] = remotes.find(
        (rm: any) => rm[options.with.remote] === r[options.with.local]
      );
    });
  }

  // Field Filtering:

  if (options.include && options.include.length) {
    workingRecords = workingRecords.map((r: any) => {
      let joinedRecord = r[options.with.as];
      if (Array.isArray(joinedRecord)) {
        joinedRecord = joinedRecord.map((jr: any) => {
          const fields: any = {};
          for (const include of options.include!) {
            if (jr[include]) fields[include] = jr[include];
          }
          jr = fields;
          return jr;
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
    workingRecords = workingRecords.map((r: any) => {
      let joinedRecord = r[options.with.as];
      if (Array.isArray(joinedRecord)) {
        joinedRecord = joinedRecord.map((jr: any) => {
          for (const exclude of options.exclude!) {
            delete jr[exclude];
          }
          return jr;
        });
      } else {
        const fields: any = {};
        for (const exclude of options.exclude!) {
          delete joinedRecord[exclude];
        }
      }
      r[options.with.as] = joinedRecord;
      return r;
    });
  }

  // Convert back into a single record in the case we forced an array for working purposes
  if (forcedArray) workingRecords = workingRecords[0];

  // Make sure we put the data where it belongs if we were working from paginated data
  if (paginated) {
    records.data = workingRecords;
  } else {
    records = workingRecords;
  }
}
