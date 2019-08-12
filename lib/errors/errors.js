module.exports = {
  401: {
    default: {
      userMessage: 'Не указан авторизационный токен'
    }
  },

  400: {
    ENTITY_VALIDATION_ERROR: {
      userMessage: 'Тело запроса не прошло валидацию'
    },

    FIELD_VALIDATION_ERROR: body => ({
      userMessage: 'Параметр не прошел валидацию',
      payload: {
        field_name: body.field_name,
        field_value: body.field_value
      }
    })
  },

  403: {
    ACCESS_FORBIDDEN: {
      userMessage: 'Действие недоступно, у приложения нет требуемых разрешений'
    },

    INVALID_OAUTH_TOKEN: {
      userMessage: 'OAuth-токен отсутствует или невалиден'
    },

    INVALID_USER_ID: body => ({
      userMessage: 'ID пользователя, выдавшего токен, отличается от указанного в запросе',
      payload: {
        available_user_id: body.available_user_id
      }
    }),

    LICENCE_NOT_ACCEPTED: {
      userMessage: 'Необходимо принять Пользовательское соглашение.'
    }
  },

  404: {
    RESOURCE_NOT_FOUND: {
      userMessage: 'Ресурс по запрошенному пути не существует'
    }
  },

  405: {
    METHOD_NOT_ALLOWED: {
      userMessage: 'HTTP-метод не поддерживается для этого ресурса'
    }
  },

  406: {
    CONTENT_TYPE_UNSUPPORTED: body => ({
      userMessage: 'Типы контента, переданные в заголовке Accept не поддерживаются',
      payload: {
        acceptable_types: body.acceptable_types
      }
    })
  },

  410: {
    UPLOAD_ADDRESS_EXPIRED: body => ({
      userMessage: 'Ресурс недоступен',
      payload: {
        valid_until: body.valid_until
      }
    })
  },

  413: {
    REQUEST_ENTITY_TOO_LARGE: {
      userMessage: 'Размер файла превышает ограничения'
    }
  },

  415: {
    CONTENT_TYPE_UNSUPPORTED: body => ({
      userMessage: 'Тип контента запроса не поддерживается.',
      payload: {
        supported_content_types: body.supported_content_types
      }
    }),

    CONTENT_ENCODING_UNSUPPORTED: body => ({
      userMessage: 'Кодировка запроса не поддерживается',
      payload: {
        supported_content_encodings: body.supported_content_encodings
      }
    })
  },

  429: {
    TOO_MANY_REQUESTS_ERROR: {
      userMessage: 'Превышен лимит на количество запросов'
    }
  }
};
