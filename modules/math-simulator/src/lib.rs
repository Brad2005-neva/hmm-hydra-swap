use pyo3::prelude::*;
use pyo3::types::PyTuple;
use std::fs::File;
use std::io::prelude::*;

const FILE_NAME: &str = "simulation.py";
const FILE_PATH: &str = "../../../math-simulator/simulation.py";
const MODULE_NAME: &str = "simulation";

pub struct Model {
    py_src: String,
    pub x0: String,
    pub y0: String,
    pub c: String,
    pub i: String,
    pub scale: u8,
}

impl Model {
    pub fn new(x0: String, y0: String, c: String, i: String, scale: u8) -> Model {
        let src_file = File::open(FILE_PATH);
        let mut src_file = match src_file {
            Ok(file) => file,
            Err(error) => {
                panic!("{:?}\n Please copy https://colab.research.google.com/drive/1TsWxjrkqiHQD9PU4V-RCX9hmMZKuEuBb?usp=sharing into sim/simulation.py`", error)
            }
        };
        let mut src_content = String::new();
        let _ = src_file.read_to_string(&mut src_content);

        Self {
            py_src: src_content,
            x0,
            y0,
            c,
            i,
            scale,
        }
    }

    pub fn sim_delta_y_amm(&self, delta_x: String) -> (u128, bool) {
        let gil = Python::acquire_gil();
        let result: (u128, bool) = self
            .call1(gil.python(), "sim_delta_y_amm", (delta_x,))
            .unwrap()
            .extract(gil.python())
            .unwrap();
        result
    }

    pub fn sim_delta_x_amm(&self, delta_y: String) -> (u128, bool) {
        let gil = Python::acquire_gil();
        let result: (u128, bool) = self
            .call1(gil.python(), "sim_delta_x_amm", (delta_y,))
            .unwrap()
            .extract(gil.python())
            .unwrap();
        result
    }

    pub fn sim_delta_y_hmm(&self, delta_x: String) -> (u128, bool) {
        let gil = Python::acquire_gil();
        let result: (u128, bool) = self
            .call1(gil.python(), "sim_delta_y_hmm", (delta_x,))
            .unwrap()
            .extract(gil.python())
            .unwrap();
        result
    }

    pub fn sim_delta_x_hmm(&self, delta_y: String) -> (u128, bool) {
        let gil = Python::acquire_gil();
        let result: (u128, bool) = self
            .call1(gil.python(), "sim_delta_x_hmm", (delta_y,))
            .unwrap()
            .extract(gil.python())
            .unwrap();
        result
    }

    pub fn sim_add_liquidity(
        &self,
        x_amount: String,
        y_amount: String,
        x_reserve: String,
        y_reserve: String,
        total_liquidity: String,
    ) -> (u128, bool) {
        let gil = Python::acquire_gil();
        let result: (u128, bool) = self
            .call1(
                gil.python(),
                "sim_add_liquidity",
                (x_amount, y_amount, x_reserve, y_reserve, total_liquidity),
            )
            .unwrap()
            .extract(gil.python())
            .unwrap();
        result
    }

    fn call1(
        &self,
        py: Python,
        method_name: &str,
        args: impl IntoPy<Py<PyTuple>>,
    ) -> Result<PyObject, PyErr> {
        let sim = PyModule::from_code(py, &self.py_src, FILE_NAME, MODULE_NAME).unwrap();
        let model = sim
            .call1(
                "Curve",
                (
                    self.x0.clone(),
                    self.y0.clone(),
                    self.c.clone(),
                    self.i.clone(),
                    self.scale,
                ),
            )
            .unwrap()
            .to_object(py);
        let py_ret = model.as_ref(py).call_method1(method_name, args);
        self.extract_py_ret(py, py_ret)
    }

    fn extract_py_ret(&self, py: Python, ret: PyResult<&PyAny>) -> Result<PyObject, PyErr> {
        match ret {
            Ok(v) => v.extract(),
            Err(e) => {
                e.print_and_set_sys_last_vars(py);
                panic!("Python execution failed.")
            }
        }
    }
}
