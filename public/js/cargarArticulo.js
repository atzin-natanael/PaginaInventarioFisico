const inputCodigo = document.querySelector('#codigo');
const inputDescripcion = document.querySelector('#descripcion');

    inputCodigo.addEventListener('change', async (e) => {
      const codigo = e.target.value.trim();
      
      if (codigo.length > 0) {
        try {
          inputDescripcion.value = 'Buscando producto...';
          
          // Ajusta esta URL a tu ruta real de la API
          const url = `${process.env.API_URL}/codigobyclave/${codigo}`; 
          const respuesta = await fetch(url);
          //console.log(respuesta);
          const resultado = await respuesta.json();
          // Como el JSON es un arreglo [ {...} ], verificamos que tenga algo
          if (resultado && resultado.length > 0) {
            const articulo = resultado[0]; // Tomamos el primer objeto
            
            inputDescripcion.value = articulo.NOMBRE;
            inputDescripcion.classList.remove('text-red-500', 'border-red-500');
            inputDescripcion.classList.add('text-gray-700', 'bg-green-50');
            
            // Opcional: Si tuvieras un input de existencia, podrías llenarlo así:
            // document.querySelector('#existencia').value = articulo.EXISTENCIA_A;

          } else {
            inputDescripcion.value = '❌ PRODUCTO NO REGISTRADO';
            inputDescripcion.classList.add('text-red-500', 'border-red-500');
            inputDescripcion.classList.remove('bg-green-50');
          }
        } catch (error) {
          console.error('Error:', error);
          inputDescripcion.value = '⚠️ Error de conexión con la base de datos';
        }
      }
    });