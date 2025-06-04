const provider = 'Crypto-Pro GOST R 34.10-2012 Cryptographic Service Provider'
const providerType = 80

const getValue = value => {
  const values = value.split(',')
  for (var i = 0; i < values.length; i++) {
    const sp = values[i].split('CN=')
    if (sp.length > 1) {
      return sp[1]
    }
  }
  return null
}

export const sign = (subject, data) => {
  return new Promise((resolve, reject) => {
    window.cadesplugin.async_spawn(function*() {
      try {
        yield getVersion(provider, providerType)

        const cstore = yield window.cadesplugin.CreateObjectAsync('CAdESCOM.Store')
        yield cstore.Open()

        const certs = yield cstore.Certificates
        const subjectCerts = yield certs.Find(window.cadesplugin.CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME, subject)
        const count = yield subjectCerts.Count

        if (count === 0) {
          reject('Сертификат не найден: ' + subject)
        }

        const cert = yield subjectCerts.Item(1)

        let oSigner = yield window.cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner')

        yield oSigner.propset_Certificate(cert)
        yield oSigner.propset_Options(window.cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN)

        let oSignedData = yield window.cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')

        yield oSignedData.propset_ContentEncoding(window.cadesplugin.CADESCOM_BASE64_TO_BINARY)

        yield oSignedData.propset_Content(data)

        const signedData = yield oSignedData.SignCades(oSigner, window.cadesplugin.CADESCOM_PKCS7_TYPE)
        yield cstore.Close()

        resolve(signedData)
      } catch (err) {
        reject(window.cadesplugin.getLastError(err))
      }
    })
  })
}

// export const verify = data => {
//   return new Promise((resolve, reject) => {
//     cadesplugin.async_spawn(function *() {
//       try {
//         yield getVersion(provider, providerType)

//         const oSignedData = yield cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')

//         yield oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY)
//         yield oSignedData.VerifyCades(data, cadesplugin.CADESCOM_PKCS7_TYPE)

//         const signers = yield oSignedData.Signers
//         const count = yield signers.Count

//         let array = []
//         for (let i = 1; i <= count; i++) {
//           let signer = yield signers.Item(i)
//           let cert = yield signer.Certificate
//           let status = yield signer.SignatureStatus

//           array.push({
//             isValid: yield status.IsValid,
//             signingTime: yield signer.SigningTime,
//             thumbprint: yield cert.Thumbprint,
//             subject: getValue(yield cert.SubjectName)
//           })
//         }

//         resolve(array)
//       } catch (err) {
//         reject(cadesplugin.getLastError(err))
//       }
//     })
//   })
// }

export const getUserCertificates = () => {
  return new Promise((resolve, reject) => {
    window.cadesplugin.async_spawn(function*() {
      try {
        yield getVersion(provider, providerType)

        const cstore = yield window.cadesplugin.CreateObjectAsync('CAdESCOM.Store')

        yield cstore.Open()

        const certs = yield cstore.Certificates
        const count = yield certs.Count

        let array = []

        for (let i = 1; i <= count; i++) {
          const cert = yield certs.Item(i)

          let keyUsage = yield cert.KeyUsage()

          let isPresent = yield keyUsage.IsPresent
          let isDigitalSignatureEnabled = yield keyUsage.IsDigitalSignatureEnabled

          if (!isPresent || isDigitalSignatureEnabled) {
            array.push({
              thumbprint: yield cert.SerialNumber,
              issuer: getValue(yield cert.IssuerName),
              subject: getValue(yield cert.SubjectName),
              validTo: yield cert.ValidToDate
            })
          }
        }

        yield cstore.Close()

        resolve(array)
      } catch (error) {
        reject(window.cadesplugin.getLastError(error))
      }
    })
  })
}

const getVersion = (provider, providerType) => {
  return new Promise((resolve, reject) => {
    window.cadesplugin.async_spawn(function*() {
      try {
        const oAbout = yield window.cadesplugin.CreateObjectAsync('CAdESCOM.About')
        const oVersion = yield oAbout.CSPVersion(provider, providerType)

        // const minor = yield oVersion.MinorVersion
        // const major = yield oVersion.MajorVersion
        // const build = yield oVersion.BuildVersion

        const version = yield oVersion.toString()

        resolve(version)
      } catch (e) {
        if (e.message.indexOf('0x80090019') + 1) {
          reject(`${provider} CSP не установлен`)
        } else {
          reject(e.message)
        }
      }
    })
  })
}
