import {
  Injectable,
  InternalServerErrorException,
  StreamableFile,
} from '@nestjs/common';
import { ConcurrencyLimit } from '../../util/concurrency-limit';
import ExcelJS from 'exceljs';
import { RequirementClassifyChain } from '../chains/requirement-classify.chain';

@Injectable()
export class ArffService {
  constructor(
    private readonly requirementClassifyChain: RequirementClassifyChain,
  ) {}

  public async parse(file: Express.Multer.File): Promise<StreamableFile> {
    try {
      const data = await this.parseFile(file);
      const instances: string[][] = data.instances;

      console.log('Processing instances: ' + instances.length);
      const limit = ConcurrencyLimit.getInstance();

      await Promise.all(
        instances.map((instance, index) =>
          limit(() => this.processInstance(instance, instances, index)),
        ),
      );

      console.log('Processed instances: ' + instances.length);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('PromiseResult');

      worksheet.columns = [
        { header: 'Project', key: 'project', width: 10 },
        { header: 'Requirement', key: 'requirement', width: 30 },
        { header: 'Dataset value', key: 'datasetValue', width: 15 },
        { header: 'Speclarify Result', key: 'speclarifyResult', width: 15 },
        { header: 'Correctness', key: 'correctness', width: 15 },
      ];

      instances.forEach((instance) => {
        const row = worksheet.addRow({
          project: instance[0],
          requirement: instance[1],
          datasetValue: instance[2],
          speclarifyResult: instance[3],
          correctness: instance[2] === instance[3] ? 'Correct' : 'Incorrect',
        });

        const fill =
          instance[2] === instance[3]
            ? {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'C6EFCE' },
              }
            : {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC7CE' },
              };

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = fill as any;
        });
      });
      const total = instances.length;
      const correct = instances.filter(
        (instance) => instance[2] === instance[3],
      ).length;
      const truePositive = instances.filter(
        (instance) => instance[2] === instance[3] && instance[2] === 'F',
      ).length;

      const falsePositive = instances.filter(
        (instance) => instance[2] !== instance[3] && instance[3] === 'F',
      ).length;

      const falseNegative = instances.filter(
        (instance) => instance[2] !== instance[3] && instance[2] === 'F',
      ).length;

      const accuracy = (correct / total) * 100;
      const precision = truePositive / (truePositive + falsePositive);
      const recall = truePositive / (truePositive + falseNegative);
      const f1 = (2 * precision * recall) / (precision + recall);
      console.log('Adding summary');
      worksheet.addRow([
        'Total',
        'Correct',
        'Incorrect',
        'Accuracy',
        'Precision',
        'Recall',
        'F1',
      ]);
      worksheet.addRow([
        total,
        correct,
        total - correct,
        accuracy,
        precision,
        recall,
        f1,
      ]);
      const arrayBuffer: ArrayBuffer = await workbook.xlsx.writeBuffer();
      return new StreamableFile(new Uint8Array(arrayBuffer));
    } catch (err) {
      console.log({
        error: err,
        message: 'Failed to parse ARFF file',
      });
      throw new InternalServerErrorException(
        `Failed to parse ARFF file: ${err}`,
      );
    }
  }

  private async parseFile(
    file: Express.Multer.File,
  ): Promise<{ attributes: string[]; instances: string[][] }> {
    try {
      const data = file.buffer.toString('utf8');
      const lines = data.split('\n');
      const attributes: string[] = [];
      const instances: string[][] = [];
      let dataSection = false;

      lines.forEach((rawLine: string) => {
        const line = rawLine.trim();
        if (line.startsWith('@ATTRIBUTE')) {
          attributes.push(line.substring(10).trim());
        } else if (line.startsWith('@DATA')) {
          dataSection = true;
        } else if (dataSection && line !== '') {
          const values = line.split(',').map((value: string) =>
            value
              .trim()
              .replace(/^['"]|['"]$/g, '')
              .trim(),
          );
          instances.push(values);
        }
      });

      return { attributes, instances };
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to parse ARFF file: ${err}`,
      );
    }
  }

  private async processInstance(
    instance: string[],
    instances: string[][],
    index: number,
  ): Promise<void> {
    const requirement = instance[1];
    console.log('Processing requirement: ' + requirement);
    const exampleSet = instances.filter((_, idx) => index !== idx);
    const examples: {
      input: string;
      output: string;
    }[] = exampleSet.map((example) => ({
      input: example[1],
      output: example[2],
    }));

    try {
      const requirementType = await this.requirementClassifyChain.execute(
        requirement,
        examples,
      );

      instance.push(requirementType);
      console.log(
        'Processed requirement: ' +
          requirement +
          ' with value: ' +
          requirementType,
      );
    } catch (err) {
      console.log({
        error: err,
        message: 'Failed to process requirement',
      });
      instance.push('Unknown');
      console.log(
        'Processed requirement: ' + requirement + ' with value: Unknown',
      );
    }
  }
}
