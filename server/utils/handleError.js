const { error } = require('./apiResponse');

/**
 * Central place to turn a caught error into a proper API response.
 * Use this instead of `error(res, { message: err.message })` wherever a
 * database operation could throw — it keeps raw SQL/Sequelize internals
 * out of what the client sees, while still being specific enough to act on.
 *
 * Usage: catch (err) { return sendError(res, err); }
 */
const sendError = (res, err) => {
  // Errors we threw ourselves (err.status set) already have the right shape.
  if (err.status) {
    return error(res, { message: err.message, status: err.status });
  }

  switch (err.name) {
    case 'SequelizeUniqueConstraintError': {
      const field = err.errors?.[0]?.path || 'value';
      return error(res, { message: `That ${field} is already in use.`, status: 409 });
    }

    case 'SequelizeValidationError': {
      return error(res, {
        message: 'Validation failed',
        status: 422,
        errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
      });
    }

    case 'SequelizeForeignKeyConstraintError':
      return error(res, {
        message: 'This action references a record that no longer exists or is linked to other data.',
        status: 409,
      });

    case 'SequelizeDatabaseError':
      // e.g. invalid enum value, wrong data type — a malformed request, not a server bug.
      return error(res, { message: 'The data sent was not in a valid format.', status: 422 });

    default:
      // Genuinely unexpected — log full detail server-side, keep the client message generic.
      console.error('Unhandled error:', err);
      return error(res, { message: 'Something went wrong on our end. Please try again.', status: 500 });
  }
};

module.exports = sendError;
