/* 查看已导入配置的抽屉 */
import React, { useEffect, useState } from "react";
import { Input, Button, Drawer, Space, Form, Empty, message, Modal } from "antd";
import { REQUIRED_RULES } from "config/constant";
const { TextArea } = Input;

interface IProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: ConfigType[]) => void;
  setContent: (value: string) => void;
}

const ConfigDrawer: React.FC<IProps> = props => {
  const { visible, onClose, onSubmit, setContent } = props;
  const [configListState, setConfigListState] = useState<ConfigType[]>([]);
  const [form] = Form.useForm();

  const init = () => {
    const data = JSON.parse(localStorage.myConfig || "[]").reverse();
    form.setFieldValue("configList", data);
    setConfigListState(data);
  };

  useEffect(() => {
    if (visible) {
      init();
    }
    // eslint-disable-next-line
  }, [visible]);

  const onFinish = (values: any) => {
    localStorage.myConfig = values.configList ? JSON.stringify(values.configList) : "[]"; // 保存历史配置
    onSubmit?.(values);
  };

  const onFinishFailed = () => {
    return message.warn("有必填项没填");
  };

  return (
    <Drawer title="查看历史字段" placement={"right"} open={visible} key={"right"} size="large" onClose={onClose}>
      {configListState.length ? (
        <Form form={form} onFinish={onFinish} layout="vertical" onFinishFailed={onFinishFailed}>
          <Form.List name={"configList"}>
            {(fields, { remove }) => {
              return fields.map(field => {
                return (
                  <div className="config" style={{ marginBottom: 20 }} key={field.key}>
                    <Space style={{ marginBottom: 10 }}>
                      <Button
                        danger
                        onClick={() => {
                          remove(field.name);
                        }}
                      >
                        删除
                      </Button>
                      <Button
                        onClick={() => {
                          setContent(configListState[field.name].config); // 选择历史配置中的一个
                          onClose();
                        }}
                      >
                        选择
                      </Button>
                    </Space>
                    <Form.Item name={[field.name, "config"]} label="配置" rules={REQUIRED_RULES}>
                      <TextArea placeholder="请输入配置" autoSize={{ minRows: 2, maxRows: 3 }} readOnly />
                    </Form.Item>
                  </div>
                );
              });
            }}
          </Form.List>
          <Form.Item>
            <Space size="large">
              <Button type="primary" htmlType="submit" style={{ width: 120 }}>
                提交
              </Button>
              <Button
                onClick={() => {
                  Modal.confirm({
                    content: "确定要重置吗？",
                    okText: "确认",
                    cancelText: "取消",
                    onOk() {
                      init();
                    },
                  });
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <Empty description="暂无数据" />
      )}
    </Drawer>
  );
};

export default ConfigDrawer;
